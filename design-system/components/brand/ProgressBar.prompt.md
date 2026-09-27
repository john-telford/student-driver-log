The dashboard's core figure. Always pair the percentage caption with a human "left" value; never show a bare percentage alone.

```jsx
<ProgressBar label="50-Hour Requirement" percent={75} remaining="12h 30m left" caption="75% of 50:00" tooltip="37:30 total (27:10 day + 10:20 night)" />
<ProgressBar label="10-Hour Night Requirement" tone="accent" percent={40} remaining="6h left" caption="40% of 10:00" />
```
