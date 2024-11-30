# SAI-DBASTS
This repository contains sourse code of course project Cyber-Security and AI (AI5063). 
<br><b>Secure AI-Driven Biometric Authentication System for Telecom Services.</b>

## Project overview

This project aims to provide a <b>secure, AI-powered biometric authentication system for telecom services</b>, focusing on voice recognition and behavioral biometrics. The system is designed to provide robust user authentication while ensuring privacy, preventing bias, and protecting against spoofing attacks

### Key components of project

1. **AI models for voice recognition and behavioral biometrics**
2. **Secure data handling for biometric information**
3. **Anti-spoofing mechanisms**
4. **Privacy-preserving techniques for biometric data**
5. **Bias detection and mitigation system**
6. **Secure API for integration with telecom services**
7. **Admin dashboard for system monitoring and management**

### Key features implemented
1. **Multi-factor biometric authentication (voice + behavior)**
2. **Secure, privacy-preserving biometric data handling**
3. **Real-time anti-spoofing measures**
4. **Bias detection and mitigation in AI models**
5. **User-friendly consent management system**
6. **Secure API for integration with telecom services**
7. **Comprehensive audit logging and alerting system**

### Security and Privacy Considerations
- **Implemented strong encryption for biometric data at rest and in transit**
- **Ensured compliance with biometric data protection regulations**
- **Developed a system for regular security audits and updates**
- **Implemented strict access controls and authentication for system access**
- **Ensured transparency in AI decision-making processes**
- **Developed a robust incident response plan for potential data breaches**

## Setup and Installation Guide

### Prerequisites
Make sure you have the following tools installed on your machine:
- **Docker**: [Download Docker](https://www.docker.com/get-started)
- **Docker Compose**: Comes bundled with Docker Desktop. If you already have Docker installed, you can skip this.
- **Git**: [Download Git](https://git-scm.com/downloads)

### Steps to Set Up the Project

1. **Clone the Repository**
   Clone the repository to your local machine:

   ```bash
   git clone https://github.com/your-username/your-repository.git
   cd your-repository

2. **Create a `.env` file**  
    In the root of your project, create a `.env` file with the necessary environment variables. For example, to configure PostgreSQL:

    ```env
    POSTGRES_USER=myuser
    POSTGRES_PASSWORD=mypassword
    POSTGRES_DB=mydatabase
    POSTGRES_HOST=localhost
    ```
3. **Build Docker Containers**

    The project includes separate Dockerfiles for the frontend, backend, and database. Docker Compose is used to orchestrate all these services. Run the following command to build the Docker images and start the containers:

    ```bash
    docker-compose up --build

4. **Access the Application**

   Once the application is up and running, you can start using it for voice authentication purposes. The system is designed to provide secure authentication using voice recognition and behavioral biometrics.

   Follow these steps to authenticate using your voice:

   1. **Access the Frontend**  
      Open your web browser and navigate to [http://localhost:3000](http://localhost:3000) to access the user interface.

   2. **Create an Account** (if you're a new user)  
      - On the homepage, you’ll be prompted to create a new user account.  
      - Enter your details (e.g., name, email, etc.) and record your voice sample.
      - The system will capture a series of voice samples, which will be used for creating your voice biometric profile.

   3. **Voice Sample Recording**  
      - After submitting your details, the application will ask you to provide a voice sample.  
      - Speak a short sentence or a series of words for the system to capture your voice patterns.
      - The system will process your voice and create a unique voice print that will be stored securely for future authentication.

   4. **Login Using Voice Authentication**  
      - Once your account is set up with a voice sample, you can authenticate by speaking into your microphone.
      - On the login page, click on the **Login with Voice** option.
      - The system will prompt you to speak and the application will process your voice input and compare it with the previously recorded voice sample to authenticate you.

   5. **Authentication Feedback**  
      - If the system recognizes your voice, you will be successfully authenticated, and you will be granted access to the application.
      - If the system fails to authenticate your voice (due to mismatched voice prints or spoofing attempts), an error message will be displayed, asking you to try again.


By following these steps, you can use the application to securely authenticate yourself using your unique voice. The AI-powered biometric authentication system ensures that only authorized users are able to access their accounts, offering a secure and privacy-preserving solution for telecom services.
