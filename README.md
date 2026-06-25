# DynamoDb-GUI-Client

This project is a fork maintained from the original DynamoDb-GUI-Client
(https://github.com/Arattian/DynamoDb-GUI-Client). Thanks to previous devs for their hard work.

[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors)

## Desktop GUI client for DynamoDB

[![GitHub](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/Arattian/DynamoDb-GUI-Client/blob/master/LICENSE)

### [Release v3.5.3](https://github.com/Munawwar/DynamoDb-GUI-Client/releases/tag/v3.5.3)

![Logo](src/assets/git-logo.png)

:eyes:
![Logo](https://i.imgur.com/24jcqzs.png)

## Run

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

## Features

- [x] Remote Access of AWS DynamoDB Service\*
- [x] Desktop app with local AWS profile access
- [x] AWS SSO / IAM Identity Center profiles via `aws configure export-credentials`
- [x] Automatic credential refresh by re-resolving the selected AWS profile
- [x] Supports switching between multiple local AWS profiles
- View
  - Table view
    - [x] Records view
    - [x] Table schema view
- Operation

  - Record
    - [x] Add Record
    - [x] Edit Record
    - [x] Delete Record
  - Table
    - [x] Add Table
    - [x] Edit Table
    - [x] Delete Table
  - Filter by attribute value
  - Filter by attribute name

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table><tr><td align="center"><a href="https://github.com/Arattian"><img src="https://avatars3.githubusercontent.com/u/36269636?v=4" width="100px;" alt="Misak Poghosyan"/><br /><sub><b>Misak Poghosyan</b></sub></a><br /><a href="#infra-Arattian" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/Arattian/DynamoDb-GUI-Client/commits?author=Arattian" title="Tests">⚠️</a> <a href="#talk-Arattian" title="Talks">📢</a> <a href="#tool-Arattian" title="Tools">🔧</a> <a href="#maintenance-Arattian" title="Maintenance">🚧</a> <a href="https://github.com/Arattian/DynamoDb-GUI-Client/commits?author=Arattian" title="Code">💻</a></td><td align="center"><a href="https://github.com/gevorggalstyan"><img src="https://avatars2.githubusercontent.com/u/2598355?v=4" width="100px;" alt="Gevorg A. Galstyan"/><br /><sub><b>Gevorg A. Galstyan</b></sub></a><br /><a href="#ideas-gevorggalstyan" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-gevorggalstyan" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-gevorggalstyan" title="Maintenance">🚧</a> <a href="#talk-gevorggalstyan" title="Talks">📢</a> <a href="https://github.com/Arattian/DynamoDb-GUI-Client/commits?author=gevorggalstyan" title="Code">💻</a></td></tr></table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
