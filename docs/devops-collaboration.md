# BhoomiChain - DevOps Collaboration

## Project
BhoomiChain - Own with Trust. Transfer with Proof.

## Version Control
Git is used to track source-code and documentation changes.
The main branch stores the shared project version.

## Team Collaboration Workflow
1. Check the current branch and working-tree status.
2. Make a focused change to project code or documentation.
3. Review the changed files before staging them.
4. Commit the change with a descriptive message.
5. Push the commit to the shared GitHub repository.
6. Run the Jenkins pipeline to check the project build.

## Deployment and Monitoring
- Docker packages the backend application.
- Kubernetes manages the backend and MongoDB deployments.
- Prometheus collects monitoring metrics.
- Windows Exporter exposes Windows system metrics.

## Verification
Check Git status after committing and confirm that the intended commit appears in the repository history.
