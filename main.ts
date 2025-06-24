Deno.serve((req) => {
  console.log('Request',req)
  return new Response('Hello world')
})