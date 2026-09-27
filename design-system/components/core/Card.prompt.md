The workhorse container: white, 1px `--border`, 4px radius, no shadow. Use `padded={false}` when a Table sits flush inside.

```jsx
<Card title="Recent Trips" action={<Button variant="link" size="sm">View All</Button>} padded={false}>
  <Table … />
</Card>
```
