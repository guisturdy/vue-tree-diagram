# vue-tree-diagram

A simple component for render tree diagram for Vue.js

## DEMO

// TODO

## USEAGE

```html
<template>
  <tree-diagram :data="data" ref="td">
    <template v-slot:type-root="{value}">
      <div class="type-root">
        <h1>{{value.title}}</h1>
        <p>{{value.content}}</p>
      </div>
    </template>
    <template v-slot:type-a="{value}">
      <div class="type-a">
        <h1>{{value.title}}</h1>
        <p>{{value.value}}</p>
        <p>{{value.content}}</p>
      </div>
    </template>
    <template v-slot:type-b="{value}">
      <div class="type-b">
        <h1>{{value.title}}</h1>
        <h2>{{value.subtitle}}</h2>
        <p>{{value.value}}</p>
        <p>{{value.content}}</p>
      </div>
    </template>
    <template v-slot:default="{value}">
      <div class="type-unknow">
        <h1>{{value.title}}</h1>
        <p>unknow {{value.content}}</p>
      </div>
    </template>
  </tree-diagram>
</template>

<script>
  export default {
    data() {
      return {
        data: [
          {
            id: 1,
            type: "type-root",
            value: { title: "ROOT" },
            children: [{
              id: 2,
              type: "type-a",
              value: { title: "NodeA" },
              children: [{
                id: 3,
                type: "type-b",
                value: { title: "NodeB", subtitle: "NodeB subtitle" }
              }]
            }]
          }
        ]
      }
    }
  }
</script>
```

## API

// TODO