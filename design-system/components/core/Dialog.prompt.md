Destructive-confirmation modal. Spell out exactly what will be deleted, then "This cannot be undone."

```jsx
<Dialog open title="Delete Trip"
  description="Delete the 2026-08-14 trip (Highway, Clear, 1h 20m total)? This cannot be undone."
  footer={<><Button variant="outline">Cancel</Button><Button variant="destructive">Delete</Button></>}
/>
```
