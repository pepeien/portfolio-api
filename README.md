[![portfolio-api](.github/images/project-thumbnail.png)]()

# portfolio-api

### tl;dr

 ```
git clone https://github.com/pepeien/portfolio-api.git
cd portfolio-api/
docker-compose up --build
```

### Requirements

- [Docker](https://docs.docker.com/engine/install) (Windows, Linux, Mac)

### Setting up

Please reach for the following services to receive a guidance on how to setup the environment:

- [karikariyaki](https://github.com/pepeien/karikariyaki-api)
- [projects](https://github.com/pepeien/projects-api)
- [namah](https://github.com/pepeien/namah-api)

### Running with TLS

If you want to deploy this project publicly you will need tweak a few things:

1. Open up the `setup-tls.sh` file and replace the placeholder values thar are tagged with the comment `# REPLACE WITH VALID DOMAIN`;

2. Reach the `nginx/` folder inside this project;

3. Open up the `reverse_proxy.conf` file and replace the placeholder values, such as `www.example.org`;

4. Reach to the root of the project;

5. Run the file `setup-tls.sh` and follow the prompted steps.
 
Now you are ready to use the project, just issue a `docker-compose up --build` and you're good to go

### Running without TLS

If you want to run as a developer:

1. Follow steps 2 ~ 3 from the `Running with SSL` section;
  
2. Issue a `docker-compose up -f docker-compose.dev.yaml --build` and you're good to go.

## About the Project

Firstly, this project was to only provide [namah](https://github.com/pepeien/namah) project, but as i worked on it, i deciced to be the back-end source for all my portfolio related projects.

## Documentation

You can reach to the [Developer Portal](https://github.com/pepeien/portfolio-api) to a more hands-on driven information.
