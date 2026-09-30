<p align="center">
  <img src="../assets/readme/banners/document-management.svg" alt="Document Management: formatted library views with approval and retention flows" width="100%">
</p>

**A SharePoint document management system with JSON-formatted views, an approval workflow, automatic handling of rejected documents and custom permissions.**

<p>
  <img src="https://img.shields.io/badge/SharePoint%20Online-0B6A0B?style=flat-square" alt="SharePoint Online">
  <img src="https://img.shields.io/badge/Power%20Automate-0066FF?style=flat-square" alt="Power Automate">
  <img src="https://img.shields.io/badge/JSON%20View%20Formatting-1F2937?style=flat-square" alt="JSON view formatting">
  <img src="https://img.shields.io/badge/CSS-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS">
</p>

## The problem

Shared document libraries get cluttered. Pending, approved and rejected files sit side by side, old rejected documents never get cleaned up, and the default views make it hard to see which files have been approved.

## Key features

- **Custom views.** JSON-formatted Standard, Calendar, Approved By and Gallery views.
- **Gallery tile view** for a visual document layout.
- **Styled standard view** with custom formatting.
- **Approval workflow** for submitted documents.
- **Rejected-document handling.** Rejected files are moved to a separate folder automatically.
- **Auto-clean-up.** Rejected documents older than 7 days are deleted.
- **Custom permissions** at a fine-grained level for secure document handling.

```mermaid
flowchart LR
  U[Upload document] --> AP{Approval}
  AP -->|Approved| LIB[Stays in library<br/>Approved By view]
  AP -->|Rejected| RJ[Moved to Rejected folder]
  RJ -->|older than 7 days| DEL[Deleted by scheduled flow]
```

## Screenshots

![DMS screenshot 1](Images/photo_1_2023-12-17_12-41-37.jpg)
![DMS screenshot 2](Images/photo_2_2023-12-17_12-41-37.jpg)
![DMS screenshot 3](Images/photo_3_2023-12-17_12-41-37.jpg)
![DMS screenshot 4](Images/photo_4_2023-12-17_12-41-37.jpg)
![DMS screenshot 5](Images/photo_5_2023-12-17_12-41-37.jpg)
![DMS screenshot 6](Images/photo_6_2023-12-17_12-41-37.jpg)
![DMS screenshot 7](Images/photo_7_2023-12-17_12-41-37.jpg)
![DMS screenshot 8](Images/photo_8_2023-12-17_12-41-37.jpg)
![DMS screenshot 9](Images/photo_9_2023-12-17_12-41-37.jpg)
![DMS screenshot 10](Images/photo_10_2023-12-17_12-41-37.jpg)
![DMS screenshot 11](Images/photo_11_2023-12-17_12-41-37.jpg)
![DMS screenshot 12](Images/photo_12_2023-12-17_12-41-37.jpg)
![DMS screenshot 13](Images/photo_13_2023-12-17_12-41-37.jpg)

---

Built by [Munir Ali](https://www.linkedin.com/in/munir-ali-7b9607234/) · [Back to portfolio](../README.md)
