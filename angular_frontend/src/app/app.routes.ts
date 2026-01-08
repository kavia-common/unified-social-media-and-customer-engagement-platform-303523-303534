import { Routes } from '@angular/router';
import { authGuard } from './api/guards/auth.guard';
import { AppShellComponent } from './layout/app-shell.component';
import { AccountsPage } from './pages/accounts.page';
import { AgentStudioPage } from './pages/agent-studio.page';
import { AgentTemplatesPage } from './pages/agent-templates.page';
import { CalendarPage } from './pages/calendar.page';
import { ChatPage } from './pages/chat.page';
import { DashboardPage } from './pages/dashboard.page';
import { EventsPage } from './pages/events.page';
import { IntegrationsPage } from './pages/integrations.page';
import { LoginPage } from './pages/login.page';
import { PostManagementPage } from './pages/post-management.page';
import { UserManagementPage } from './pages/user-management.page';
import { WebsiteActivityPage } from './pages/website-activity.page';

/**
 * Core application routes:
 * - Uses AppShellComponent as a layout wrapper.
 * - Placeholder pages for all major modules specified in requirements.
 */
export const routes: Routes = [
  { path: 'login', component: LoginPage },

  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

      { path: 'dashboard', component: DashboardPage },
      { path: 'post-management', component: PostManagementPage },
      { path: 'calendar', component: CalendarPage },
      { path: 'chat', component: ChatPage },
      { path: 'accounts', component: AccountsPage },
      { path: 'events', component: EventsPage },
      { path: 'integrations', component: IntegrationsPage },
      { path: 'website-activity', component: WebsiteActivityPage },
      { path: 'agent-studio', component: AgentStudioPage },
      { path: 'agent-templates', component: AgentTemplatesPage },
      { path: 'user-management', component: UserManagementPage },

      // Fallback (keep inside shell so nav remains visible)
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
