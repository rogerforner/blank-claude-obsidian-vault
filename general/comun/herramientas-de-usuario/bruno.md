---
name: bruno
description: Manual de Bruno, el cliente de API de colecciones en texto, con su CLI para el agente: instalacion con Homebrew y npm a la misma version, ajustes, comprobacion y actualizacion.
type: manual
version: 1.0
---

# Bruno

## Para qué sirve y quién la usa

Bruno es un cliente de API que guarda las colecciones como ficheros de texto, que se versionan y se leen sin la aplicación. La app la usa el director; la CLI (`bru`), el agente. Por qué esta forma y cómo la usa el vault está en [[herramientas_comunes_de_usuario]].

## Requisitos

- Homebrew (en macOS).
- Node con `npm`, para la CLI.

## Instalación

### macOS

1. `brew install --cask bruno`
2. `npm install -g @usebruno/cli@<la misma versión que la app>`

La versión de la app se ve con `brew info --cask bruno`. App y CLI tienen que ir a la misma versión.

### Debian

[SIN MANUAL PARA ESTE SISTEMA]

### Windows 11

[SIN MANUAL PARA ESTE SISTEMA]

## Configuración tras instalar

La app guarda las preferencias en `~/Library/Application Support/bruno/preferences.json`. Claves, bajo `preferences`:

- **Actualización automática: se apaga, obligatorio.** `autoupdate.downloadUpdates` en `false`. App y CLI se actualizan juntas y a mano; la cask lleva además `auto_updates`. Se apaga desde los ajustes de la app.
- **Telemetría: opcional.** `telemetry.enabled`; por defecto `true`. Envía un aviso diario anónimo con el sistema operativo y la versión. Se apaga desde los ajustes de la app.
- **Mock Server: opcional.** Servidor local activado por defecto desde la 4.2.0: `beta.mock-server` en `true`. Se apaga desde los ajustes de la app, en la sección beta.

## Comprobación

    bru --version
    defaults read /Applications/Bruno.app/Contents/Info.plist CFBundleShortVersionString

- Las dos órdenes tienen que dar el mismo número (hoy `4.2.1`).
- `preferences.json` tiene que mostrar `downloadUpdates` en `false`.

## Problemas conocidos

Ninguno medido en esta máquina.

## Actualización

Las dos a la vez y a la misma versión:

1. `brew upgrade --cask bruno`
2. `npm install -g @usebruno/cli@<versión>`

Después, repetir la comprobación y mirar que `downloadUpdates` sigue en `false`.

## Desinstalación

[SIN MEDIR] Por la vía inversa de la instalación (`brew uninstall --cask bruno` y `npm uninstall -g @usebruno/cli`), sin probar.

## Medido

Medido: 2026-10-11, bruno 4.2.1 (app y CLI), macOS 27.0.1, instalada por sin dato
