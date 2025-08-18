"use client"

import { Settings2, User, Users, Heart, Activity, Home } from "lucide-react"
import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from "@/components/ui/sidebar"
import { NavMain } from "../_components/nav-main"
import { NavUser } from "../_components/nav-user"
import { TeamSwitcher } from "../_components/team-switcher"

export function AppSidebar({
  userData,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  userData: {
    name: string
    email: string
    avatar: string
    membership: string
  }
}) {
  const data = {
    user: userData,
    teams: [
      {
        name: "Personal",
        logo: User,
        plan: "Account"
      },
      {
        name: "Team 1",
        logo: Users,
        plan: "Team"
      },
      {
        name: "Team 2",
        logo: Users,
        plan: "Team"
      },
      {
        name: "Team 3",
        logo: Users,
        plan: "Team"
      }
    ],
    navMain: [
      {
        title: "Home",
        url: "/dashboard",
        icon: Home,
        isActive: true,
        items: []
      },
      {
        title: "Health Services",
        url: "#",
        icon: Heart,
        items: [
          {
            title: "Risk Assessment",
            url: "/dashboard/risk-assessment"
          },
          {
            title: "My Results",
            url: "/dashboard/results"
          },
          {
            title: "Test Centers",
            url: "/dashboard/test-centers"
          }
        ]
      },
      {
        title: "Treatment",
        url: "#",
        icon: Activity,
        items: [
          {
            title: "ART Management",
            url: "/dashboard/art"
          },
          {
            title: "Appointments",
            url: "/dashboard/appointments"
          },
          {
            title: "Reminders",
            url: "/dashboard/reminders"
          }
        ]
      },
      {
        title: "Account",
        url: "#",
        icon: User,
        items: [
          {
            title: "Profile",
            url: "/dashboard/account"
          },
          {
            title: "Billing",
            url: "/dashboard/billing"
          },
          {
            title: "Support",
            url: "/dashboard/support"
          }
        ]
      },
      {
        title: "Settings",
        url: "#",
        icon: Settings2,
        items: [
          {
            title: "General",
            url: "/dashboard/settings"
          },
          {
            title: "Privacy",
            url: "/dashboard/privacy"
          },
          {
            title: "Consent Management",
            url: "/dashboard/consent"
          }
        ]
      }
    ]
  }
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
