```sh
npx postgraphile -c 'postgres://postgres:randomPWD123@localhost/postgres' --host 0.0.0.0  --cors --watch --dynamic-json
```

```sh
npx postgraphile -c 'postgres://postgres:postgres@localhost/postgres' --host 0.0.0.0 --port 15000  --cors --watch --dynamic-json
```