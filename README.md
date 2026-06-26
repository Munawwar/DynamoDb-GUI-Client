# DynamoDb-GUI-Client

<img src="src/assets/dynamodb-gui-logo.png" alt="DynamoDb GUI logo" width="160">

This project is a fork maintained from the original DynamoDb-GUI-Client
(https://github.com/Arattian/DynamoDb-GUI-Client). Thanks to previous devs for their hard work.

[![GitHub](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/Arattian/DynamoDb-GUI-Client/blob/master/LICENSE)

## Web App (AWS SSO unsupported)

https://dynamodb.pages.dev

## Desktop App

### [Latest release](https://github.com/Munawwar/DynamoDb-GUI-Client/releases)

## Screenshot
![Logo](https://i.imgur.com/24jcqzs.png)

## Development

Fast desktop dev mode with Vue HMR:

```bash
npm run dev
```

Browser-only dev mode:

```bash
npm run dev:browser
```

Production-like Electron run:

```bash
git clone https://github.com/Munawwar/DynamoDb-GUI-Client.git
cd DynamoDb-GUI-Client
npm i
aws sso login --profile <your-profile>
npm start
```

## Package

```bash
git clone https://github.com/Munawwar/DynamoDb-GUI-Client.git
cd DynamoDb-GUI-Client
npm i
npm run package
```
