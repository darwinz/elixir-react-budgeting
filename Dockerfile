FROM elixir:1.19

RUN apt-get update \
 && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
 && apt-get install -y nodejs inotify-tools postgresql-client \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* \
 && mix local.hex --force \
 && mix local.rebar --force

WORKDIR /app

COPY mix.exs mix.lock ./
RUN mix deps.get && mix deps.compile

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 4000
CMD ["./run.sh"]
