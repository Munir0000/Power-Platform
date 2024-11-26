function AccountCategoryChangeNew(executionContext) {
  // Get the form context from the executionContext
  var formContext = executionContext.getFormContext();

  if (formContext.getAttribute("ma_hrpriority").getValue() != 1) {
    formContext.ui.tabs.get("tab_5").setVisible(false);
    console.log("Tab is hidden because HR Priority is not set to High.");
  } else {
    formContext.ui.tabs.get("tab_5").setVisible(true);
    console.log("Tab is visible because HR Priority is set to High.");
  }
}
