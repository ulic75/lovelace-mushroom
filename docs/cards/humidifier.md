# Humidifier card

![Humidifier light](../images/humidifier-light.png)
![Humidifier dark](../images/humidifier-dark.png)

## Description

A humidifier card allow you to control a humidifier entity.

## Configuration variables

All the options are available in the lovelace editor but you can use `yaml` if you want.

| Name                           | Type    | Default     | Description                                                                         |
| :----------------------------- | :------ | :---------- | :---------------------------------------------------------------------------------- |
| `entity`                       | string  | Required    | Humidifier entity                                                                   |
| `icon`                         | string  | Optional    | Custom icon                                                                         |
| `name`                         | string  | Optional    | Custom name                                                                         |
| `fill_container`               | boolean | `false`     | Fill container or not. Useful when card is in a grid, vertical or horizontal layout |
| `layout`                       | string  | Optional    | Layout of the card. Vertical, horizontal and default layout are supported           |
| `hide_state`                   | boolean | `false`     | Hide the entity state                                                               |
| `show_target_humidity_control` | boolean | Optional    | Show target humidity control                                                        |
| `collapsible_controls`         | boolean | `false`     | Collapse controls when off                                                          |
| `tap_action`                   | action  | `more-info` | Home assistant action to perform on tap                                             |
| `hold_action`                  | action  | `more-info` | Home assistant action to perform on hold                                            |
| `double_tap_action`            | action  | `more-info` | Home assistant action to perform on double_tap                                      |
