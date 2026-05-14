<template>
  <component 
     :is="item.url ? 'a' : 'div'"
     :href="item.url" 
     :target="item.target" 
     rel="noreferrer" 
     class="service-link-wrapper"
  >
    <div class="card" :style="item.background ? `background-color: ${item.background};` : ''">
      <div class="card-content">
        <div class="service-media">
          
          <div class="service-media-left">
            <slot name="icon">
              <figure v-if="item.logo" class="image service-logo-container">
                <img :src="item.logo" :alt="`${item.name} logo`" class="service-logo" />
              </figure>
            </slot>
          </div>
          
          <div class="service-media-content">
            <slot name="content">
              <p class="title service-title">
                {{ item.name }}
              </p>
              <p v-if="item.subtitle" class="subtitle service-subtitle">
                {{ item.subtitle }}
              </p>
              
              <div v-if="item.quick" class="tags service-quick-links">
                <a v-for="(link, linkIndex) in item.quick" :key="linkIndex"
                   class="tag is-rounded is-small service-quick-link"
                   :style="link.color ? `background-color: ${link.color}; color: #fff;` : ''"
                   :href="link.url" :target="link.target" rel="noreferrer"
                   @click.stop>
                  <span v-if="link.icon" class="icon is-small">
                    <i :class="link.icon"></i>
                  </span>
                  {{ link.name }}
                </a>
              </div>
            </slot>
          </div>
          
          <div class="service-media-right">
            <slot name="indicator"></slot>
          </div>

        </div>
      </div>
      
      <div v-if="item.tag" class="service-tag">
        <span class="tag is-small" :class="item.tagstyle">#{{ item.tag }}</span>
      </div>
      
    </div>
  </component>
</template>

<script>
export default {
  name: "Generic",
  props: {
    item: Object,
  }
};
</script>
