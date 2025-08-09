# MindMeter - Modern Mental Health Assessment Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://openjdk.java.net/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-green.svg)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)

MindMeter is a comprehensive system designed to support students in self-assessment of depression, anxiety, stress, connecting with psychological experts, receiving AI consultation, and proactive self-care.

---

## 🚀 Key Features

### 📊 Mental Health Assessment Tests

- **DASS-21/DASS-42**: Comprehensive assessment of depression, anxiety, and stress levels
- **BDI (Beck Depression Inventory)**: Depression assessment using Beck scale
- **RADS (Reynolds Adolescent Depression Scale)**: Depression assessment for adolescents
- **EPDS (Edinburgh Postnatal Depression Scale)**: Postpartum depression assessment
- **SAS (Zung Anxiety Scale)**: Anxiety level assessment

### 👥 User Management & Role-based Access

- **Admin**: System management, statistics, user management
- **Expert**: View test results, send advice, counsel students
- **Student**: Take tests, view results, receive consultation
- **Anonymous User**: Take tests anonymously, upgrade to real account

### 🤖 Intelligent AI Chatbot

- Chat with AI assistant (OpenAI GPT-3.5)
- Suggest appropriate tests based on symptoms
- Multi-language support (Vietnamese/English)
- Save chat history, download conversations

### 🌐 Multi-language & Interface

- **Multi-language**: Vietnamese/English with i18next
- **Dark/Light mode**: Modern interface with theme persistence
- **Responsive**: Optimized for all devices
- **Consistent UI/UX**: Unified header/footer, sans-serif font

### 🔐 Security & Authentication

- **JWT Authentication**: Token-based authentication
- **OAuth2 Google**: Google login integration
- **BCrypt**: Password encryption
- **Anonymous Testing**: Take tests without registration

---

## 🛠️ Technology Stack

### Backend

- **Java 17** with Spring Boot 3.5.0
- **Spring Security** with JWT and OAuth2
- **Spring Data JPA** with MySQL 8+
- **Spring Mail** for email sending
- **Maven** for dependency management
- **Lombok** for reducing boilerplate code

### Frontend

- **React 18** with React Router DOM
- **Tailwind CSS** for styling
- **i18next** for internationalization
- **Axios** for HTTP requests
- **Recharts** for statistical charts
- **React Icons** for icons
- **JWT Decode** for token processing

### Database

- **MySQL 8.0+** with auto-generated schema
- **SQL File**: `database/MindMeter.sql` contains schema and sample data

### AI & External Services

- **OpenAI GPT-3.5** for chatbot
- **Google OAuth2** for authentication
- **Gmail SMTP** for email sending

---

## 📦 Installation & Setup

### 1. Prerequisites

```bash
# System Requirements
- Java 17 (JDK 17)
- Node.js 18+ and npm
- MySQL 8.0+
- Maven 3.6+
- Git
```

### 2. Clone and Setup

```bash
# Clone repository
git clone https://github.com/TranKienCuong2003/MindMeter.git
cd MindMeter

# Setup database
mysql -u root -p < database/MindMeter.sql
```

### 3. Backend Configuration

Edit file `backend/src/main/resources/application.properties`:

```properties
# Database
spring.datasource.username=your-username
spring.datasource.password=your-password

# Email (Gmail SMTP)
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
contact.receiver.email=your-email@gmail.com

# Google OAuth2 (optional)
spring.security.oauth2.client.registration.google.client-id=your-client-id
spring.security.oauth2.client.registration.google.client-secret=your-client-secret

# OpenAI API (for chatbot)
OPENAI_API_KEY=your-openai-api-key
```

### 4. Run Backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend will run at: http://localhost:8080

### 5. Run Frontend

```bash
cd frontend
npm install
npm start
```

Frontend will run at: http://localhost:3000

---

## 👤 Sample Accounts

| Role        | Email                           | Password |
| ----------- | ------------------------------- | -------- |
| **Admin**   | trankiencuong30072003@gmail.com | 123456   |
| **Expert**  | cuongcodehub@gmail.com          | 123456   |
| **Student** | kiencuongdev2004@gmail.com      | 123456   |

---

## 📁 Project Structure

```
MindMeter/
├── backend/                          # Spring Boot Backend
│   ├── src/main/java/com/shop/backend/
│   │   ├── config/                   # Spring Security, Web Configuration
│   │   ├── controller/               # REST API Controllers
│   │   ├── dto/                      # Data Transfer Objects
│   │   ├── model/                    # JPA Entities
│   │   ├── repository/               # JPA Repositories
│   │   ├── security/                 # JWT, OAuth2 Security
│   │   └── service/                  # Business Logic Services
│   ├── src/main/resources/
│   │   └── application.properties    # Application Configuration
│   └── pom.xml                       # Maven Dependencies
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── components/               # React Components
│   │   ├── pages/                    # Page Components
│   │   ├── locales/                  # i18n Translations
│   │   └── services/                 # API Services
│   ├── public/                       # Static Assets
│   └── package.json                  # Node.js Dependencies
├── database/
│   └── MindMeter.sql                 # Database Schema & Sample Data
└── README.md
```

---

## 🔌 Main API Endpoints

### Authentication

- `POST /api/auth/register` - Register account
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/anonymous/create` - Create anonymous account
- `PUT /api/auth/anonymous/upgrade/{userId}` - Upgrade anonymous account

### Depression Tests

- `GET /api/depression-test/questions?type={testType}` - Get test questions
- `POST /api/depression-test/submit` - Submit test
- `GET /api/depression-test/history` - Test history

### Expert Management

- `GET /api/expert/test-results` - Test results for experts
- `POST /api/expert/advice` - Send advice
- `GET /api/expert/students` - Student list

### Chatbot & Feedback

- `POST /api/chatbot` - Chat with AI
- `POST /api/feedback` - Send feedback
- `POST /api/contact` - Send contact message

---

## 🎨 Outstanding UI/UX Features

### Modern Interface

- **Dark/Light mode** with state persistence
- **Responsive design** for all devices
- **Smooth animations** and transitions
- **Consistent design system** with Tailwind CSS

### User Experience

- **Anonymous testing** - Take tests without registration
- **Account upgrade** - Upgrade anonymous accounts
- **Real-time chat** with typewriter effect
- **Interactive charts** for statistics
- **Pagination** with ellipsis for long lists

### Multi-language

- **Vietnamese/English** with real-time switching
- **Localized content** for all text and messages
- **Dynamic page titles** based on language

---

## 🔒 Security

### Authentication & Authorization

- **JWT tokens** with expiration
- **Role-based access control** (ADMIN, EXPERT, STUDENT)
- **OAuth2 Google** integration
- **Anonymous user support** with upgrade capability

### Data Protection

- **BCrypt password hashing**
- **Input validation** and sanitization
- **SQL injection prevention** with JPA
- **XSS protection** with proper encoding

### Privacy

- **Anonymous testing** without storing personal information
- **Secure email communication**
- **Data encryption** for sensitive information

---

## 🚀 Deployment

### Backend (JAR)

```bash
cd backend
./mvnw clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### Frontend (Build)

```bash
cd frontend
npm run build
# Serve build folder with nginx or static server
```

### Environment Variables

```bash
# Database
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/mindmeter
SPRING_DATASOURCE_USERNAME=your-username
SPRING_DATASOURCE_PASSWORD=your-password

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION=86400000

# Email
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-app-password

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Google OAuth2
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

---

## 🐛 Troubleshooting Common Issues

### Database Issues

```bash
# Check MySQL service
sudo systemctl status mysql

# Check connection
mysql -u root -p -h localhost
```

### Port Conflicts

```bash
# Check ports in use
netstat -tulpn | grep :8080
netstat -tulpn | grep :3000

# Kill process if needed
kill -9 <PID>
```

### Node Modules Issues

```bash
# Remove and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Maven Issues

```bash
# Clean and rebuild
./mvnw clean install
```

---

## 📞 Support & Contact

- **Email**: trankiencuong30072003@gmail.com
- **GitHub**: https://github.com/TranKienCuong2003/MindMeter.git

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

This project is developed for educational and research purposes.

---

**MindMeter** - Modern, professional, and friendly depression diagnosis platform 🧠✨
