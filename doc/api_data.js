define({ "api": [
  {
    "type": "post",
    "url": "/sign-in",
    "title": "Login existing user by email and password",
    "name": "SignIn",
    "group": "User",
    "permission": [
      {
        "name": "none"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email address which was used at SignUp</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Password which associated with email</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>Result of performing request</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Access token for next requests</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>An Email address of user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "avatarUrl",
            "description": "<p>An URL address of stored avatar</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "originAvatarUrl",
            "description": "<p>An URL address of original avatar</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "BadRequest",
            "description": "<p>If provided &quot;email&quot; and &quot;password&quot; pair was not found in system</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"status\": \"error\",\n  \"message\": \"Provided \\\"email\\\" and \\\"password\\\" combination was not found.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/server/controllers/UserController.js",
    "groupTitle": "User",
    "sampleRequest": [
      {
        "url": "https://api.github.com/v1/sign-in"
      }
    ]
  },
  {
    "type": "post",
    "url": "/sign-up",
    "title": "Register new user of a system",
    "name": "SignUp",
    "group": "User",
    "permission": [
      {
        "name": "none"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email address of new user</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Desired password for new user</p>"
          },
          {
            "group": "Parameter",
            "type": "File",
            "optional": false,
            "field": "avatar",
            "description": "<p>Image which will be used as avatar of user</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>Result of performing request</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Access token for next requests</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "avatarUrl",
            "description": "<p>An URL address of stored avatar</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "BadRequest",
            "description": "<p>If some data was not provided, has wrong value or user was registered previously</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response (example):",
          "content": "HTTP/1.1 400 Bad Request\n{\n  \"status\": \"error\",\n  \"message\": \"Validation error(s) with parameters \\\"email\\\" appeared.\",\n  \"errors\": { \"email\": \"User with provided \"email\" already exists.\" }\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/server/controllers/UserController.js",
    "groupTitle": "User",
    "sampleRequest": [
      {
        "url": "https://api.github.com/v1/sign-up"
      }
    ]
  }
] });
