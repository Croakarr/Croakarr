# Croakerr
An extendable, plugin driven Webhook receiver, intended to help media library management simpler.


## Features
Croakerr is a simple application which exposes a HTTP server to which webhooks may be `POST`ed. It determines which services have been sending data based on request headers and other deduction methods, and can be easily extended via its plugin API

It ships with four core plugins at the moment:
- [Lidarr](https://github.com/CroakerrApp/CroakerrPlugins/tree/main/Lidarr) - A plugin which provides media notifications for [Lidarr](https://lidarr.audio)
- [Radarr](https://github.com/CroakerrApp/CroakerrPlugins/tree/main/Radarr) - A plugin which provides media notifications for [Radarr](https://radarr.video)
- [Sonarr](https://github.com/CroakerrApp/CroakerrPlugins/tree/main/Sonarr) - A plugin which provides media notifications for [Sonarr](https://sonarr.tv/)
- [CroakerrForPlex](https://github.com/CroakerrApp/CroakerrPlugins/tree/main/CroakerrForPlex) - A plugin which provides notifications for [Plex](https://plex.tv)

There is also a fifth plugin, which was created for testing purposes but may serve a useful function to some users:

- [CroakerrForiCue](https://github.com/CroakerrApp/CroakerrPlugins/tree/main/CroakerrForiCue) - A plugin which tracks notifications and flashes your [iCue](https://www.corsair.com/uk/en/Categories/Products/CORSAIR-iCUE/c/Cor_Products_iCue_Compatibility) enabled devices a specific brand color to help identify notification sources at a glance


## Installation
> Coming soon...


## Configuration
Currently unavailable, configuration is hard-coded for testing purposes, however a future update will result in the creation of a configuration file, as well as methods to modify it.

## Development
Got a cool plugin idea? We are working on a suite of tools to make developing Croakerr plugins super easy, but these things take time, and lots of experimentation, as such our tools are not currently available, however our plugin source code is available [here](https://github.com/CroakerrApp/plugins)