"use client"

import { Settings2, User, Heart, Home, Shield, MapPin, FileText, Phone } from "lucide-react"
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
        name: "BantAI HIV Platform",
        logo: Shield,
        plan: "Patient Portal"
      }
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
        isActive: true,
        items: []
      },
      {
        title: "My Health",
        url: "#",
        icon: Heart,
        items: [
          {
            title: "Risk Assessment",
            url: "/dashboard/risk-assessment"
          },
          {
            title: "Test Results",
            url: "/dashboard/results"
          },
          {
            title: "My Appointments",
            url: "/dashboard/appointments"
          }
        ]
      },
      {
        title: "Resources",
        url: "#",
        icon: MapPin,
        items: [
          {
            title: "Find Test Centers",
            url: "/dashboard/test-centers"
          },
          {
            title: "Educational Materials",
            url: "/dashboard/resources"
          },
          {
            title: "Emergency Contacts",
            url: "/dashboard/emergency-contacts"
          }
        ]
      },
      {
        title: "My Account",
        url: "#",
        icon: User,
        items: [
          {
            title: "Profile",
            url: "/dashboard/account"
          },
          {
            title: "Privacy Settings",
            url: "/dashboard/privacy"
          },
          {
            title: "Consent Management",
            url: "/dashboard/consent"
          }
        ]
      },
      {
        title: "Support",
        url: "#",
        icon: Phone,
        items: [
          {
            title: "Contact Support",
            url: "/dashboard/support"
          },
          {
            title: "FAQ",
            url: "/dashboard/faq"
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
