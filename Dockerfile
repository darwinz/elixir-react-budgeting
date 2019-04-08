FROM elixir:1.8.1
MAINTAINER Brandon Johnson <bbj1979@gmail.com>

RUN apt-get update \
 && curl -sL https://deb.nodesource.com/setup_10.x | bash \
 && apt-get install -y apt-utils \
 && apt-get install -y nodejs \
 && apt-get install -y build-essential \
 && apt-get install -y inotify-tools \
 && apt-get install -y postgresql-client \
 && mix local.rebar --force

ENV APP_HOME /app
RUN mkdir -p $APP_HOME
ADD . /app

RUN mix local.hex --force
RUN mix archive.install --force https://github.com/phoenixframework/archives/raw/master/phx_new.ez

WORKDIR /app
EXPOSE 4000
CMD ["./run.sh"]
