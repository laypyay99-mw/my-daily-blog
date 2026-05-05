# Application Overview

This Next.js application, developed within the Firebase Studio environment, serves as a personal blogging platform. It allows users to create and view posts, which can include both text and media (images or videos) shared from Google Drive.

# Style, Design, and Features

## Initial Version

- **Core Functionality:** Users can create text-only posts and view a chronological feed of all entries.
- **Design:** The application features a clean, modern design with a focus on readability. It utilizes a dark theme with a blurred, background image, and a white, semi-transparent card-based layout for posts.
- **Technology:** Built with Next.js and Firebase, the application uses Firestore for real-time data synchronization.

## Media Integration (Google Drive)

- **Feature:** The application supports media sharing from Google Drive. Users can paste a Google Drive link to an image or video, and it will be embedded in their post.
- **Implementation:** The application extracts the file ID from the Google Drive link and uses it to construct an embeddable URL. This allows for easy sharing of media without the need for direct uploads.

## Polished Error Handling

- **Feature:** The application now features a redesigned error page that aligns with the overall visual style.
- **Implementation:** The `error.tsx` file has been updated to include a more visually appealing layout, providing a more consistent and user-friendly experience in the event of an error.
