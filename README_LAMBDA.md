# Lambda branch
This uses the serverless-express package to wrap the existing Express application as a Lambda.

Having problems with db connections, works intermittently :-(

## Installation
Install using 
npm run package-deploy

After install you have to manually:
- Give VPC permissions
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "ec2:DescribeNetworkInterfaces",
          "ec2:CreateNetworkInterface",
          "ec2:DeleteNetworkInterface",
          "ec2:DescribeInstances",
          "ec2:AttachNetworkInterface"
        ],
        "Resource": "*"
      }
    ]
  }
- Move the Lambda to the VPC
- Add the Env variable CONNECTIONSTRING.