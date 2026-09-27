Uppercase, letter-spaced button in the highway-sign voice — use `accent` (yellow) for the single primary action on a screen, `primary` (green) for form submits, `outline` for cancel.

```jsx
<Button variant="accent" size="sm">+ Log Trip</Button>
<Button variant="primary" size="md" type="submit" fullWidth>Log Trip</Button>
<Button variant="outline" size="md">Cancel</Button>
<Button variant="destructive" size="md">Delete</Button>
```

Never sentence-case the label; never round the corners past 4px.
