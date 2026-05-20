'use client';

import * as React from 'react';
import { NavMain } from '@/components/shared/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { sidebarItems } from '@/data/sidebar';
import Link from 'next/link';
import Image from 'next/image';

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Link
                            href={'/dashboard'}
                            className="cursor-pointer flex items-center gap-2 text-xl"
                        >
                            <SidebarMenuButton
                                asChild
                                className="w-[300px] h-[80px] mx-auto"
                            >
                                <Image
                                    src="https://res.cloudinary.com/dny7zfbg9/image/upload/v1755925557/uigjdstdcvlsngrtxbrl.png"
                                    alt="Web Briks Logo"
                                    width={200}
                                    height={60}
                                    className="h-12 w-auto"
                                    priority
                                />
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={sidebarItems} />
            </SidebarContent>
        </Sidebar>
    );
}
