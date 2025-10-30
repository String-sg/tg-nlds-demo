import { toast } from 'sonner'

/**
 * Toast message variants for different feature types
 */
export const comingSoonToast = {
  /**
   * Default coming soon message
   */
  default: () => {
    toast.info('Coming soon! This feature is in development.')
  },

  /**
   * For app launches
   */
  app: (appName?: string) => {
    const message = appName
      ? `${appName} is coming soon!`
      : 'This app is coming soon!'
    toast.info(message)
  },

  /**
   * For general features
   */
  feature: (featureName?: string) => {
    const message = featureName
      ? `${featureName} is in development.`
      : 'This feature is in development.'
    toast.info(message)
  },

  /**
   * For reports and analytics
   */
  report: () => {
    toast.info('Detailed reports will be available soon.')
  },

  /**
   * For management tools
   */
  management: (toolName?: string) => {
    const message = toolName
      ? `${toolName} management features coming soon.`
      : 'Management features coming soon.'
    toast.info(message)
  },

  /**
   * For form templates
   */
  form: (formName?: string) => {
    const message = formName
      ? `${formName} template is being finalized.`
      : 'This form template is being finalized.'
    toast.info(message)
  },

  /**
   * For custom messages
   */
  custom: (message: string) => {
    toast.info(message)
  },
}
