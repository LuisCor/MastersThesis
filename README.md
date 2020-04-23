# **Phyrem** - A service for remote physiotherapy

This repository contains the development of a complete system for providing remote physiothrapy.

## Usage
Deploying with Docker:
  docker-compose build && docker-compose up

Deploying detached, and attach to the backend for debugging:
  docker-compose build && docker-compose up -d && docker attach --sig-proxy=false phyrem-backend