import { Application, Context } from 'probot' // eslint-disable-line no-unused-vars

async function isSenderExternal(context: Context) : Promise<boolean>{
  const repo = context.payload.repository.name;
  const sender = context.payload.sender; // .type .site_admin
  console.log(repo + sender);
  return true
}

async function commitNotApproved() : Promise<boolean>{
  // Commit is approved
  return false
}

export = (app: Application) => {
  // Triggered by a manual/api workflow dispatch
  // app.on('workflow_dispatch', async context => {
  //   const owner = context.payload.repository.owner.login;
  //   const repo = context.payload.repository.name;
  //   console.log(owner + repo);
  //
  // // TODO: check if is triggered from internal
  //
  // // TODO: OR check if author is internal
  //
  // //  TODO OR check if
  //
  // });

  // Triggered by an automated event
  // To mock this event during testing:
  // node_modules/.bin/probot receive -e workflow_run -p test/fixtures/workflow_run.requested.json ./lib/index.js
  app.on('workflow_run', async context => {
    const action = context.payload.action;

    // Only listen to workflow_run.requested webhooks
    if (action != "requested") return;

    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;
    const run_id = context.payload.workflow_run.id;
    let cancel_workflow = false;
    let sender_is_external = await isSenderExternal(context);
    let commit_not_approved = await commitNotApproved();
    cancel_workflow = sender_is_external && commit_not_approved;

    if (cancel_workflow) {
      console.log("Cancelling workflow run");
      await context.github.actions.cancelWorkflowRun({
        owner,
        repo,
        run_id
      })
    }
  });
}
