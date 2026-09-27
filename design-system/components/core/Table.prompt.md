Trips and report tables. Right-align and mark `numeric` on any duration or date column; em dash (—) stands in for a zero value.

```jsx
<Table
  columns={[{key:'date',label:'Date',numeric:true},{key:'day',label:'Daytime',align:'right',numeric:true}]}
  rows={[{date:'2026-08-14',day:'1h 20m'}]}
/>
```
