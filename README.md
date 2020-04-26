# **Phyrem** - A service for remote physiotherapy

[![CircleCI](https://circleci.com/gh/LuisCor/MastersThesis.svg?style=svg&circle-token=2541639b24bfe3a5e2af3aecc28ac7cf53073dc6)](https://circleci.com/gh/LuisCor/MastersThesis/?branch=master)


This repository contains the development of a complete system for providing remote physiothrapy.

## Usage
Deploying with Docker:
  docker-compose build && docker-compose up

Deploying detached, and attach to the backend for debugging:
  docker-compose build && docker-compose up -d && docker attach --sig-proxy=false phyrem-backend