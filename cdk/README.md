
- 최초에 시작할 때

```
npm install -g typescript
npm link typescript
```

- 프로젝트를 clone했을 때

```
cd cdk
npm install
```

- github oauth token 
```
aws secretsmanager create-secret --name secret_token_name --secret-string '{"github-token":"69176fbxxxxxxxxxxxxxxxxxxx22fdac2b78"}'
```

- cross-env (cross-env ( yarn add -D cross-env or npm i -D cross-env ).)

```
npx cross-env GITHUB_TOKEN=... cdk deploy PipelineStack
npm i -D cross-env  cdk deploy PipelineStack
```

# Trouble Shooting

### Cannot find module 'typescript'

- https://stackoverflow.com/questions/44611526/how-to-fix-cannot-find-module-typescript-in-angular-4

```
npm install -g typescript
npm link typescript
```

### failed bootstrapping: Error: Please pass '--cloudformation-execution-policies'

```
npx cdk bootstrap --profile closeyes2 --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
aws://ACCOUNT1/us-east-2
```

