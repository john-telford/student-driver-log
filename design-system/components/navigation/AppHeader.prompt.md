Every signed-in screen sits under this: 56px green bar, 4px yellow rule, wordmark left, uppercase 12px/700 links, yellow CTA, account controls right.

```jsx
<AppHeader
  links={[{label:'Trips'},{label:'Report'},{label:'Settings'}]}
  active="Trips"
  cta={<Button variant="accent" size="sm">+ Log Trip</Button>}
  right={<Button variant="link" size="sm" style={{color:'var(--accent)',fontSize:'var(--text-micro)'}}>Sign Out</Button>}
/>
```
