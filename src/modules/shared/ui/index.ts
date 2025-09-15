// UI Components
import Alert from './Alert.vue'
import BaseCard from './BaseCard.vue'
import BaseTable from './BaseTable.vue'
import Button from './Button.vue'
import DataTable from './DataTable.vue'
import FilterPanel from './FilterPanel.vue'
import InputField from './InputField.vue'
import Modal from './Modal.vue'
import Pagination from './Pagination.vue'
import PriorityBadge from './PriorityBadge.vue'
import SelectField from './SelectField.vue'
import StatCard from './StatCard.vue'
import StatusBadge from './StatusBadge.vue'

export {
  Alert,
  BaseCard,
  BaseTable,
  Button,
  DataTable,
  FilterPanel,
  InputField,
  Modal,
  Pagination,
  PriorityBadge,
  SelectField,
  StatCard,
  StatusBadge
}

// Default export for Vue plugin
export default {
  install(app: any) {
    app.component('Alert', Alert)
    app.component('BaseCard', BaseCard)
    app.component('BaseTable', BaseTable)
    app.component('Button', Button)
    app.component('DataTable', DataTable)
    app.component('FilterPanel', FilterPanel)
    app.component('InputField', InputField)
    app.component('Modal', Modal)
    app.component('Pagination', Pagination)
    app.component('PriorityBadge', PriorityBadge)
    app.component('SelectField', SelectField)
    app.component('StatCard', StatCard)
    app.component('StatusBadge', StatusBadge)
  }
}
