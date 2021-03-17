# **PhyRem Backend** - Server Application, Database and Docker

CI Test Result -> [![CircleCI](https://circleci.com/gh/PhyRemProject/PhyRem_BE.svg?style=svg&circle-token=79f74f6eb060be57ff90327b39886a93297b7f30)](https://circleci.com/gh/PhyRemProject/PhyRem_BE/?branch=master)


This is the PhyRem Backend components, these are: a NodeJS with Express server application, managing a MongoDB through Mongoose. These components are all containerized with Docker and a `docker-compose` file is available for easy deployment of the service.

#

## **Backend Structure**

All components are containerized and are deployed automatically. A _Nginx_ server is started at port 80 and proxies requests to the appropriate applications. 

The PhyRem Frontend is also hosted by this structure but is hosted at another repository, please pull both this repository and [PhyRem - Frontend](https://github.com/PhyRemProject/Phyrem-Frontend) and have them at the same root directory, meaning:
```
Phyrem >
        Phyrem_BE
        Phyrem_FE
```

Here is an image to understand the Docker container structure:

![Backend Docker Structure](readmeimgs/docker_architecture.png?raw=true)

#

## **Server Application**

## API Documentation

As with most projects, documentation is not a priority, this is no exception (sorry). The server application generates an OpenAPI file with documentation, explorable using the _Redoc_ service deployed with docker.

You can access this documentation by navigating to `localhost:3001`, this address can change but its usually hosted at port 3001.

## Application Structure

The application is split in three main types of components:
- Routes: The REST endpoints, here is specified the authorization and authentication for each method.
- Controllers: Are the functions that have the logic to receive, process and return the data.
- Schemas: The components that specify the database schema for the different documents and creates the model to be used by other components of the system.

Here is an image representing the structure of the application:

![Server Application Structure](readmeimgs/server_architecture.png?raw=true)

#

## **Before Start**
What are you trying to do?

**Deploy the application:** 

First make sure you also push the [PhyRem - Frontend](https://github.com/PhyRemProject/Phyrem-Frontend) and have it in the same directory level as this repository. Although it is not necessary to do this, it can serve as a debugging tool.

Docker is recommended for deployment, set the environment varibles according to your environemnt (read next section) and run `docker-compose up -d`. No further configuration should be necessary.

If issues arise use `docker logs *container_name*` to debug.
A situation that rarely happens is the server app starting before the database is ready and crashing. If this is the case restart the application with: `docker restart phyrem-backend`.


**Develop/Debug the application:** 

To develop or debug this application it should be ran as a standalone application since the Dockerfile is built for deployment.

If Docker is desired for this case, change the Dockerfile `ENTRYPOINT npm run prod` to `ENTRYPOINT npm dev`


If the app is to be run as standalone, like with any NodeJS application first run:
`npm install`

Next you can either build the Typescript to JS by running:

`npm run build` followd by `npm start`.

Or the RECOMMENDED `npm run dev`.

In this case, further env variables need to be changed (next section).

<sup>Note, if running as a standalone application, the developer should provide a MongoDB instance.</sup>


## **Environment Variables**
**The application requires a few variables to be set, default works but is not recommended!**

The variables can be found in the *.env* file and are explained there.

`JWT_SECRET, NOREPLY_EMAIL, NOREPLY_EMAIL_PASS` should be set and remain private, this variables should not be available anywhere and this file should not be pushed to a repository. It is here for ease of use only.

If running standalone: `MONGODB_ADDRESS, USER_IMAGES, EXERCISES` should also be set accordingly as these can crash the server if set incorrectly. Use a temporary user directory for debug.
