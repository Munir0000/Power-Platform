<p align="center">
  <img src="../assets/readme/banners/weather-api.svg" alt="Weather API: current weather and forecast through a custom connector" width="100%">
</p>

**A Power Apps weather app that gets current conditions and forecasts through a custom connector, with a Celsius/Fahrenheit toggle.**

<p>
  <img src="https://img.shields.io/badge/Power%20Apps-742774?style=flat-square" alt="Power Apps">
  <img src="https://img.shields.io/badge/Custom%20Connector-0078D4?style=flat-square" alt="Custom connector">
  <img src="https://img.shields.io/badge/OpenAPI%202.0-6BA539?style=flat-square&logo=swagger&logoColor=white" alt="OpenAPI 2.0">
  <img src="https://img.shields.io/badge/WeatherAPI.com-1F2937?style=flat-square" alt="WeatherAPI.com">
</p>

## The problem

Power Apps has no built-in connector for many public APIs. A custom connector lets an app call the API securely and reuse the same connection across apps.

## Key features

- **Custom connector** exposing a `GetWeatherAndForecast` operation, authenticated with an API key.
- **Search** for a location from the search bar and show its results.
- **Unit toggle.** Switching between Celsius and Fahrenheit updates both current conditions and the forecast.

```mermaid
flowchart LR
  UI[Power Apps<br/>search + °C/°F toggle] -->|GetWeatherAndForecast| CC[Custom connector<br/>API key auth]
  CC -->|GET /v1/forecast.json| API[WeatherAPI.com]
  API -->|current + forecast| UI
```

The connector is defined in Swagger 2.0 against `api.weatherapi.com`. It exposes `GET /v1/forecast.json` with the parameters `q`, `days`, `aqi` and `alerts`.

## Screenshots

### App
![Weather app UI 1](Images/ui1.jpg)
![Weather app UI 2](Images/ui2.jpg)

### Custom connector setup
![Custom connector setup 1](Images/photo_1_2024-10-07_19-15-02.jpg)
![Custom connector setup 2](Images/wap1.jpg)
![Custom connector setup 3](Images/wap2.jpg)
![Custom connector setup 4](Images/wap2.png)

---

Built by [Munir Ali](https://www.linkedin.com/in/munir-ali-7b9607234/) · [Back to portfolio](../README.md)
