# vue-tree-diagram

A simple component for render tree diagram for Vue.js

## DEMO

// TODO

## USEAGE

```html
<template>
  <tree-diagram :data="data">
    <tree-diagram-node type="type-root">
      <template scope="{node}">
        <div class="type-root">
          <h1>{{node.title}}</h1>
        </div>
      </template>
    </tree-diagram-node>
    <tree-diagram-node type="type-a">
      <template scope="{node}">
        <div class="type-a">
          <h1>{{node.title}}</h1>
          <p>{{node.value}}</p>
        </div>
      </template>
    </tree-diagram-node>
    <tree-diagram-node type="type-b">
      <template scope="{node}">
        <div class="type-b">
          <h1>{{node.title}}</h1>
          <h2>{{node.subtitle}}</h2>
          <p>{{node.value}}</p>
        </div>
      </template>
    </tree-diagram-node>
  </tree-diagram>
</template>

<script>
  export default {
    data() {
      return {
        tableData: [
          {
            title: "ROOT",
            type: "type-root",
            children: [{
              title: "NodeA",
              type: "type-a",
              children: [{
                title: "NodeB",
                subtitle: "NodeB subtitle",
                type: "type-b",
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