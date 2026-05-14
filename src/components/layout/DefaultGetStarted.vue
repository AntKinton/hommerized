<template>
  <article class="container">
    <div class="m-6 has-text-centered py-6">
      <p class="title is-4 mb-2">No configuration found!</p>
      <p class="subtitle is-6 mt-2">Check out the documentation to start building your dashboard.</p>
      <p class="mt-5">
        <a
          class="button is-primary has-text-weight-black"
          href="https://github.com/antkinton/hommerized/blob/main/docs/configuration.md#configuration"
          target="_blank"
        >
          Get started &rarr;
        </a>
      </p>
    </div>
  </article>
</template>

<script>
export default {
  name: "DefaultGetStarted",
  props: {
    config: {
      type: Object,
      default: null
    }
  }
};
</script>

