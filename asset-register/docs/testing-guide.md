# Test the Asset Register app: records and security roles

This guide walks you through testing the published Asset Register code app in your **Development** environment. Part A checks that creating and updating records works. Part B checks that security roles give each person the right access. It assumes you have never set up Dataverse security before.

**App link** (the play URL from the last push):

```
https://apps.powerapps.com/play/e/292afabb-8008-e236-a8b0-c6e4427dde4a/app/0013abc9-75ba-44dd-8dec-4b497a2d8272?tenantId=49d0e663-7e75-4083-b63c-3e87413f78af
```

> **Before you start:** You can't test security roles with your own account. You're a **System Administrator** in this environment, and that role bypasses every table permission, so the app will always work for you. Real security testing needs a **second, non-admin user**. That user needs a **Power Apps Premium** licence (or trial), because code apps that use Dataverse are premium. If you can't get a second licensed user, you can still do Part A, but Part B will only prove that the roles are configured, not that they work.

---

## Part A: Test records as yourself

## 1. Open the app and check it loads real data

a. Open the app link above in your normal browser, signed in as `MunirPowerLearn@muniralifordev1gmail.onmicrosoft.com`.

b. The landing page opens. Select **Open the live app**.

c. The **Overview** page opens. Check that the greeting shows your first name and that the **Sites** cards show your real sites and asset counts.

d. Select **Assets** in the top bar and check that your assets are listed.

*Why this matters:* It proves the published app is talking to Dataverse, not the sample data you saw in screenshots.
*Common mistake to avoid:* Opening the old **Local Play** link from `npm run dev` instead of the published link. That tests your local copy, not what you pushed.

## 2. Create a test asset

a. On **Assets**, select **New asset**.

b. Fill in:

| Field | Value |
|---|---|
| Asset name | `TEST Laptop 001` |
| Asset tag | `TEST-001` |
| Category | Laptop |
| Status | Available |
| Site | pick any site |

c. Leave **Assigned to** as **Unassigned**.

d. Select **Create asset**.

e. You should land on the new asset's page with a green **Asset created.** message.

*Why this matters:* It proves the create permission and the Site lookup work together.
*Common mistake to avoid:* Leaving **Site** on **Select a site**. The asset is still created, but without a site, so it won't appear when the list is scoped to a site, and it looks as if the save failed.

## 3. Edit the asset and assign it to someone

a. On the test asset's page, change **Status** to **Assigned**.

b. In **Assigned to**, pick any person.

c. The status line next to the buttons changes to **Unsaved changes** and **Save changes** turns blue. Select **Save changes**.

d. Check that **Changes saved** appears next to the buttons.

e. Reload the browser page (F5) and check that **Assigned to** still shows the person you picked.

*Why this matters:* Setting a person needs extra Dataverse permissions (**Append** and **Append To**), which Part B tests for other users.
*Common mistake to avoid:* Not reloading. The page updates from the save response, so only a reload proves the value was stored in Dataverse.

## 4. Clear the assignment

a. On the same asset, set **Assigned to** back to **Unassigned**.

b. Select **Save changes**, then reload the page.

c. **Assigned to** should show **Unassigned**.

*Why this matters:* Clearing a person is the one save path that was never tested against real Dataverse.
*Common mistake to avoid:* Seeing **Changes saved** and assuming it worked. Only the reload shows whether Dataverse actually cleared the value. If the person is still there after reloading, or you get an error, copy the message and send it to the developer.

## 5. Record a condition check

a. On the test asset's page, select **Record check**.

b. Select rating **2 (Fair)**.

c. Check that **Checked by** shows your name already selected.

d. Type a comment, for example `Test check`.

e. Select **Save check**.

f. You should return to the asset with **Check saved · 2 Fair.** at the top, and the new check listed first under **Recent checks**.

g. The **Condition** panel should now show **2 Fair** and **Checked … today**.

*Why this matters:* One save writes two records: the check itself and the asset's latest rating. This step proves both.
*Common mistake to avoid:* Only looking at **Recent checks**. If the check appears there but the **Condition** panel still shows the old rating, the second write (updating the asset) failed.

## 6. Check the Overview updates

a. Select **Overview** in the top bar.

b. Your test asset should appear in **Needs attention**, because its rating is 2.

c. It should also appear at the top of **Recently checked**.

*Why this matters:* It confirms the dashboard reads the saved data correctly.
*Common mistake to avoid:* A site is selected that isn't the test asset's site. Both lists follow the selected site, so pick the right site card or choose **All sites** on the Assets page.

---

## Part B: Test security roles with a second user

> ⚠️ **Before you continue:** Creating users and assigning licences happens in the **Microsoft 365 admin center** and needs Global or User administrator rights in your tenant. Assigning security roles needs **System Administrator** in the environment. If you lack either right, the **Add a user** or **Manage security roles** buttons will be missing or greyed out, with no explanation.

## 7. Create a test user with a licence

a. Go to the Microsoft 365 admin center:

```
https://admin.microsoft.com
```

b. Select **Users** → **Active users** → **Add a user**.

c. Create a user, for example `asset.tester@muniralifordev1gmail.onmicrosoft.com`. Note the temporary password shown at the end.

d. On the licences step, assign **Power Apps Premium** if you have one.

e. If you have no Premium licence: this guide can't confirm the exact trial menu for your tenant. In the admin center, look under **Billing** → **Purchase services** and search for **Power Apps**; select any free **Power Apps Premium** trial and assign it to the test user.

*Why this matters:* Without a premium licence, the test user is blocked before any security role is checked, so you'd be testing licensing, not roles.
*Common mistake to avoid:* Assigning **Microsoft 365** or **Power Apps for Office 365** only. Those don't cover Dataverse apps, and the user sees a licence message instead of the app.

## 8. Add the user to the Development environment

a. Go to the Power Platform admin center:

```
https://admin.powerplatform.microsoft.com
```

b. Select **Manage** → **Environments** → **Development**.

c. Select **Settings**, expand **Users + permissions** and select **Users**.

d. Select **Add user**, search for the test user and add them.

*Why this matters:* The docs note that developer-type environments don't add users automatically, so the user must exist in the environment before you can give them roles.
*Common mistake to avoid:* Picking the wrong environment. You have several (MunirDevelopment, Development, and others); the app lives in the one named **Development**.

## 9. Create the "Asset Register User" security role

a. Still in the **Development** environment, go to **Settings** → **Users + permissions** → **Security roles**.

b. Select the role **App Opener**, then select **Copy** (called **Copy security role** in some versions of the page).

c. Name the copy `Asset Register User` and select **Copy**.

d. Open **Asset Register User**.

e. Use the **Search** box to find each table below and set its privileges. Set anything not listed to **None**.

| Table (search for) | Create | Read | Write | Delete | Append | Append To |
|---|---|---|---|---|---|---|
| Asset (`cr_asset`) | Organization | Organization | Organization | None | Organization | Organization |
| Site (`cr_site`) | None | Organization | None | None | None | Organization |
| Condition Check (`cr_conditioncheck`) | Organization | Organization | None | None | Organization | None |
| User (`systemuser`) | (leave) | Organization | (leave) | (leave) | (leave) | Organization |

f. Select **Save + close**.

*Why this matters:* These are exactly the permissions the app uses:
- **Read** shows the lists.
- **Create** and **Write** save changes.
- **Append** and **Append To** let a record point at a site or a person.
- Nothing grants Delete, because the app never deletes.

*Common mistake to avoid:* Forgetting **Append To** on **Site** or **User**. The list and detail pages load fine, but saving an asset with a site or an assigned person fails with a permission error that names `prvAppendTo`.

> If you can't find a table by its display name, search for its logical name (`cr_asset`, `cr_site`, `cr_conditioncheck`). The **User** table may sit under a **Business Management** grouping in some versions of the editor.

## 10. Create the "Asset Register Viewer" role (read-only)

a. On **Security roles**, select **Asset Register User** and select **Copy**.

b. Name it `Asset Register Viewer`.

c. Open it and change these privileges to **None**:
- **Create**, **Write** and **Append** on **Asset**.
- **Create** and **Append** on **Condition Check**.

d. Leave every **Read** at **Organization**, then select **Save + close**.

*Why this matters:* A second role lets you prove that the app blocks what a role doesn't allow, not just that it works.
*Common mistake to avoid:* Editing **Asset Register User** instead of the copy, which quietly removes write access from your main role.

## 11. Give the test user the full role and share the app

a. Go to **Settings** → **Users + permissions** → **Users**, select the test user, then select **Manage security roles**.

b. Tick **Asset Register User** and select **Save**.

c. Share the app with the test user. From the project folder in a terminal, run:

```bash
npx pa app share --principal asset.tester@muniralifordev1gmail.onmicrosoft.com --access play
```

d. If you prefer the website: go to `https://make.powerapps.com`, select the **Development** environment, select **Apps**, select **Asset Register**, and select **Share**.

*Why this matters:* Roles give access to the data and sharing gives access to the app; the user needs both.
*Common mistake to avoid:* Using `--access edit`. That lets the tester change and republish your app; testers only need `play`.

## 12. Test as the user with the full role

a. Open a private or InPrivate browser window. This keeps your admin sign-in separate.

b. Open the app link and sign in as the test user with the temporary password, then set a new one.

c. Repeat steps 2 to 5 (create an asset, assign it, clear it, record a check) using a new name like `TEST Laptop 002`.

d. Everything should work exactly as it did for you.

*Why this matters:* It proves the **Asset Register User** role alone is enough to use the app.
*Common mistake to avoid:* Testing in a normal window where you're already signed in as yourself. The app then runs as the admin and every test passes, whatever the roles say.

## 13. Test as the user with the read-only role

a. Back in your admin window, go to **Users** → the test user → **Manage security roles**.

b. Untick **Asset Register User**, tick **Asset Register Viewer**, and select **Save**.

c. In the private window, close the app tab and reopen the app link. Role changes can take a few minutes to apply.

d. Check that **Overview**, **Assets** and the asset pages all load.

e. Open any asset, change **Notes**, and select **Save changes**. You should see a red **Changes not saved.** message that mentions a missing privilege, such as `prvWritecr_asset`.

f. Select **New asset**, enter a name, and select **Create asset**. You should see an error mentioning `prvCreatecr_asset`.

g. Open any asset, select **Record check**, pick a rating and select **Save check**. You should see **Check not saved.** with an error mentioning `prvCreatecr_conditioncheck`.

*Why this matters:* It proves the security really lives in Dataverse. The app shows the same buttons to everyone, and Dataverse refuses the save.
*Common mistake to avoid:* Testing straight after changing roles. For a few minutes the old role may still apply and saves may succeed. Reopen the app and wait before deciding the role doesn't work.

## 14. Test a user with no role

a. In the admin window, remove **Asset Register Viewer** from the test user so they have no Asset Register role.

b. Reopen the app in the private window.

c. **Overview** should show **Couldn't load the snapshot.** and **Assets** should show **Couldn't load assets.**, each with a permission error. The app itself still opens because it's shared.

*Why this matters:* It proves someone the app is shared with still can't see your data without a role.
*Common mistake to avoid:* Forgetting to give the tester's role back (or removing them) after testing, which leaves a user with the wrong access in your environment.

---

## 15. Clean up the test records

> ⚠️ **Before you continue:** Deleting rows in Dataverse is permanent. There is no recycle bin for these tables. Check each row's name before you delete it.

a. Go to `https://make.powerapps.com`, select the **Development** environment, then **Tables**.

b. Open the **Condition Check** table, show its data, select the rows whose name starts with `TEST`, and delete them. Deleting the checks first avoids problems if the Asset lookup is set to block deleting assets that still have checks.

c. Open the **Asset** table and delete the `TEST Laptop` rows.

d. Optional: in the Microsoft 365 admin center, delete the test user or remove their licence.

*Why this matters:* Test rows otherwise show up in your real Overview counts and Needs attention list.
*Common mistake to avoid:* Deleting without filtering. The data grid may show many rows, so search or sort by name first so you only select `TEST` rows.

---

## Verification checklist

### Part A: records (as yourself)
- [ ] The Overview greeting shows your first name and the site cards show real sites, not Riyadh HQ / Jeddah Office / Dammam Warehouse sample data (unless those are your real sites)
- [ ] `TEST Laptop 001` appears in the Assets list after creation, under its site
- [ ] After a page reload, **Assigned to** shows the person you set
- [ ] After setting **Unassigned** and reloading, **Assigned to** shows **Unassigned** (if not, send the developer the error or behaviour)
- [ ] After saving a check, **both** the Recent checks list **and** the Condition panel show the new rating
- [ ] **Checked by** was pre-filled with your name on the check form
- [ ] The test asset appears under **Needs attention** on Overview

### Part B: security roles (as the test user, private window)
- [ ] With **Asset Register User**: create, assign, unassign and record a check all succeed
- [ ] With **Asset Register User**: saving an asset with a site and a person succeeds (no `prvAppendTo` error)
- [ ] With **Asset Register Viewer**: lists and pages load, and every save shows a red error naming a missing privilege
- [ ] With **Asset Register Viewer**: no new row appears in the Asset or Condition Check table after the failed saves
- [ ] With no role: Overview and Assets both show a load error instead of data
- [ ] The test user was testing in a private window, and the name on **Checked by** was the test user's, not yours

### Clean-up
- [ ] No `TEST` rows remain in the Asset or Condition Check tables
- [ ] The test user's roles and licence are set the way you intend to leave them
