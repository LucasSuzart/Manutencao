<template>
  <div class="table-wrapper">
    <table class="table">
      <thead><tr><slot name="head" /></tr></thead>
      <tbody><slot /></tbody>
    </table>
  </div>
</template>
<style scoped>
.table-wrapper { overflow:auto; }
table { width:100%; border-collapse:collapse; font-size:.8rem; }
th,td { padding:.5rem .6rem; border-bottom:1px solid #e2e8f0; text-align:left; }
th { background:#f8fafc; font-weight:600; font-size:.7rem; letter-spacing:.5px; text-transform:uppercase; }
tbody tr:hover { background:#f1f5f9; }
</style>