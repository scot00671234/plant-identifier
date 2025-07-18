# PlantID - Mobile Plant Identification App

## Overview

PlantID is a mobile-first web application that allows users to identify plants by taking photos or uploading images. The app uses AI-powered plant identification through the Plant.id API and provides detailed information about identified plants, including scientific names, common names, family, and descriptions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui component library
- **Styling**: Tailwind CSS with custom plant-themed color scheme
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Style**: REST API with JSON responses

### Mobile-First Design
- **Layout**: Responsive design optimized for mobile devices with max-width container
- **Navigation**: Bottom navigation bar for mobile app feel
- **Camera Integration**: Native camera API access for photo capture
- **Progressive Web App**: Configured for mobile app-like experience

## Key Components

### Data Models
- **Plant Identifications**: Stores identification results with user context
- **User Usage**: Tracks daily usage limits and premium status
- **Schema**: Defined with Drizzle ORM and Zod validation

### Core Features
1. **Camera Capture**: Native camera integration for photo capture
2. **Image Upload**: File upload support for existing images
3. **Plant Identification**: AI-powered identification via Plant.id API
4. **Usage Tracking**: Daily limits (5 free identifications per day)
5. **History Management**: Persistent storage of identification history
6. **Premium Upgrade**: Paywall for unlimited identifications

### Storage Strategy
- **Development**: In-memory storage for rapid development
- **Production**: PostgreSQL database with Drizzle ORM
- **Client Storage**: Local storage for user identification

## Data Flow

1. **Image Capture**: User takes photo or uploads image
2. **API Processing**: Image sent to Plant.id API for identification
3. **Usage Validation**: Check daily limits before processing
4. **Result Storage**: Save identification results to database
5. **History Display**: Show past identifications with detailed information

## External Dependencies

### Core Dependencies
- **Plant.id API**: Third-party plant identification service
- **Neon Database**: Serverless PostgreSQL hosting
- **Radix UI**: Accessible component primitives
- **TanStack Query**: Server state management
- **Drizzle ORM**: Type-safe database operations

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and development experience
- **Tailwind CSS**: Utility-first styling
- **ESBuild**: Production bundling

## Deployment Strategy

### Build Process
- **Client Build**: Vite builds React app to `dist/public`
- **Server Build**: ESBuild bundles Express server to `dist/index.js`
- **Type Checking**: TypeScript compilation verification

### Environment Configuration
- **Database**: PostgreSQL connection via `DATABASE_URL`
- **API Keys**: Plant.id API key via environment variables
- **Development**: Hot reload with Vite middleware
- **Production**: Static file serving with Express

### Database Management
- **Migrations**: Drizzle Kit for schema migrations
- **Schema**: Shared schema definitions between client and server
- **Deployment**: Push schema changes with `db:push` command

The application follows a modern full-stack architecture with emphasis on type safety, developer experience, and mobile-first design principles.

## Recent Changes

### July 18, 2025 - Updated Paywall System
- **Change**: Modified usage limits from 3 daily uses to 3 total uses
- **Impact**: Users now have 3 free plant identifications for the entire app lifetime, not per day
- **Database**: Updated schema to remove daily tracking and trial period functionality
- **Client**: Updated UI to reflect new total usage limits
- **Backend**: Simplified usage tracking logic to count total uses instead of daily resets