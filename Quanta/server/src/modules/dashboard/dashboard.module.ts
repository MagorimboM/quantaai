import {DashboardController} from"@/modules/dashboard/dashboard.controller"; 
import {DashboardService} from "@/modules/dashboard/dashboard.service"; 
import {DashboardRepository} from "@/modules/dashboard/dashboard.repository"; 
import {Module} from "@nestjs/common"; 


@Module({
    controllers:[DashboardController], 
    providers:[DashboardRepository, DashboardService]
})
export class DashBoardModule{}; 