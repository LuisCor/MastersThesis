# **Phyrem** - A service for remote physiotherapy

[![CircleCI](https://circleci.com/gh/LuisCor/PhyRem_BE.svg?style=svg&circle-token=79f74f6eb060be57ff90327b39886a93297b7f30)](https://circleci.com/gh/LuisCor/PhyRem_BE/?branch=master)


This repository contains the development of a complete system for providing remote physiothrapy.

## Usage
Deploying with Docker:
  docker-compose build && docker-compose up

Deploying detached, and attach to the backend for debugging:
  docker-compose build && docker-compose up -d && docker attach --sig-proxy=false phyrem-backend
