## API for sending emails to GitHub users

Test project with SignIn, SignUp and sending emails logic.

Project can be found by [this link](https://nodejs-github-emails.herokuapp.com/)

To setUp project locally you can use [nodejs-github-emails-docker](https://github.com/hlushko/nodejs-github-emails-docker) repository.

To run this project you need to configure ENV variables described below:

- `MONGODB_URI` - connection URL to [MongoDB](https://www.mongodb.com/) instance;
- `CLOUDINARY_URL` - connection URL to [Cloudinary](https://cloudinary.com/) CDN system;
- `PORT` - port which server will listen;
- `MAIL_TRANSPORT` - SMTPS link server for emails sending;
- `GITHUB_USERNAME` - username at GitHub website;
- `GITHUB_TOKEN` - access token associated with username;
- `SENTRY_DSN` - **(optional)** connection URL to [Sentry.io](https://sentry.io/) error tracking tool.
