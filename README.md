# My Budgeting App

A simple income / expense tracking app, built with Elixir / Phoenix and React

Pre-requisites (running in docker)
------------------

* Docker (https://docs.docker.com/docker-for-mac/install/)
* Docker compose (https://docs.docker.com/compose/install/)


Install / Setup
------------------

* Clone this repository
* Run `docker-compose build`
```bash
$ docker-compose build
```
* Run `docker-compose up`
```bash
$ docker-compose up
```


Pre-requisites (running sans docker)
------------------

* Elixir 1.7+
* Erlang 19, 20, or 21
* Phoenix 1.4.3+
* PostgreSQL 9.6.3
* NPM 5.3+
* Node.js 8.5.0+
* React 16.1.1+


Install / Setup
------------------

* Install dependencies
```bash
$ mix deps.get
```
* Create and migrate your database
```bash
$ mix ecto.create && mix ecto.migrate
```
* Seed the database
```bash
$ mix run priv/repo/seeds.exs
```
* Install JavaScript dependencies
```bash
$ npm install
```
* Start Phoenix server
```bash
$ mix phoenix.server
```

-or-

```bash
$ iex -S mix phoenix.server
```

Visit [localhost:4000](http://localhost:4000) in browser

Testing
------------------

* Run the test suite
```bash
$ MIX_ENV=test mix espec.init
$ MIX_ENV=test mix espec
```
