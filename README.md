# Keypro Assigment Backend

I built a simple server for the test. Due to it being an MVP and just an extra bonus for the Frontend role, I didn't adhere to the proper architecture patterns like MVC or Repository pattern

## Usage

### Enviroment

Copy `.env.example` to `.env` and change configure. If you use the default docker-compose.yml for the development then you don't need to change anything.

### Development

Optional: Start the docker compose

```bash
docker compose up --detach

# After done the development

docker compose down

# Clean up

docker compose up
```

Run seed data postgres for development

```bash
node scripts/seed.mjs
```

```bash
# Required: typescript watch compilation
$ npm run watch

# Required: development server with hot reload (nodemon)
$ npm run dev

# Format with prettier
$ npm run format
```

### Production

```bash
# build for production
$ npm run build

# start production app
$ npm run start
```
