Three-up totals row on the dashboard: Daytime / Nighttime / Total, values in H:MM.

```jsx
<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
  <StatTile label="Daytime" value="27:10" />
  <StatTile label="Nighttime" value="10:20" />
  <StatTile label="Total" value="37:30" />
</div>
```
