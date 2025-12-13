<template>
  <div class="top-up-dialog p-20">
    <Banner color="info" class="mb-20">
      Replenishment of the balance <b>{{ namespace }} / {{ name }}</b
      >.
    </Banner>

    <form @submit.prevent="submit">
      <LabeledInput
        v-model:value="amount"
        class="mb-20"
        label="Amount"
        required
        type="number"
        min="1"
      />

      <div class="actions">
        <button type="button" class="btn btn-primary" @click="close">
          Close
        </button>
        <button type="submit" class="btn role-tertiary">
          Top up on Yookassa
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { LabeledInput } from "@components/Form/LabeledInput";
import { Banner } from "@components/Banner";

export default {
  components: { LabeledInput, Banner },
  props: {
    name: { type: String, required: true },
    namespace: { type: String, required: true },
  },
  data() {
    return { amount: "" };
  },
  methods: {
    close() {
      this.$emit("close");
    },
    async submit() {
      const setting = await this.$store.dispatch("management/find", {
        type: "management.cattle.io.setting",
        id: "gorizond-install-payment-url",
      });
      const pay_url = setting.value;
      const userId =
        this.$store.getters["auth/v3User"]?.id ||
        this.$store.getters["auth/principalId"] ||
        "";
      this.openPostInNewTab(pay_url + `/payment`, {
        namespace: this.namespace,
        name: this.name,
        amount: this.amount,
        userId,
      });
      this.close();
    },

    openPostInNewTab(action, data) {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = action;
      form.target = "_blank";

      Object.entries(data).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    },
  },
};
</script>
