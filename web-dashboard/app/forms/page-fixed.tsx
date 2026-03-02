// Temporary file to show the fix for the draft refresh issue
// The fix is to add a small delay before reloading drafts, or to reload before navigating

// In handleSaveForm, change this section:
/*
OLD CODE:
      router.replace('/forms');
      await loadDrafts();
      await loadRejectedFormsData();

NEW CODE:
      // Reload drafts first, then navigate
      await Promise.all([loadDrafts(), loadRejectedFormsData()]);
      router.replace('/forms');
*/

// This ensures the draft list is refreshed from the database BEFORE the navigation happens
// So when the forms page renders, it already has the updated list without the submitted form
