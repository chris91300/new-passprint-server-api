import { databaseInterface } from '../interfaces/database.interface';
import { Model } from 'mongoose';
import { WebSiteDataType } from 'types/webSite';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WebSite } from '../schemas/WebSite.schema';

@Injectable()
class DatabaseMongoose implements databaseInterface {
  constructor(
    @InjectModel('WebSite')
    private readonly WebSiteModel: Model<WebSite>,
  ) {}

  public async createWebSite(webSiteData: WebSiteDataType, authKey: string) {
    const createdAt = Date.now();
    const webSite = new this.WebSiteModel({
      ...webSiteData,
      authKey,
      createdAt,
    });
    await webSite.save();
  }
  /*
    public async generateNewCode(codeUuid: string, code: number, endOfValidityOfCode: number){
        
        await EmailCode.updateOne({uuid: codeUuid}, {value: code, endOfValidity: endOfValidityOfCode});
        const codeInformations =  await EmailCode.findOne<CodeInformations>({ uuid: codeUuid });

        if(codeInformations){
            return codeInformations;
        }else{
            throw new Error("une erreur est survenue lors de la génération du nouveau code")
        }
        
    }

    public async getCodeInformationsInDatabase(code: number){
        
        try{

            const codeInformations = await EmailCode.findOne<CodeInformations>({
                value: code
            })

            if( codeInformations ){
                
                return codeInformations;

            }else{
                
                throw new Error("Code non valide A")
            }
        
            
        }catch(err){
            console.log(err)
            throw new Error("Code non valide")
        }
    }

    

    public async removeCodeInformationsFromDatabase(uuid: string, value: number){
        
        try{
            
            await WebSite.deleteOne({
                uuid,
                value
            });

        }catch(err){
            console.log(err)
        }
    }

    public async getAvis(){
        try{
            const avis = await WebSite.find<WebSiteDatabaseType>({avisStatus: "done", avisChecked: true, avisValidated: true}).select(["entreprise", "firstName", "job", "avis", "avisStars"]);
            return avis;
            
        }catch(err){
            console.log(err)
            throw new Error("Une erreur est survenue lors de la récupération des avis")
        }
    }

   

    public async setAvis(uuid: string, rating: number, message: string[]){
        const query = {
            uuid
        }

        const options = {
            avisStars: rating,
            avis: message,
            avisStatus: "done"
        }

        await WebSite.findOneAndUpdate(query, options);
    }

    public async deleteAvisForm(uuid: string){
        await WebSite.deleteOne({uuid});
    }

    public async getWebSite(uuid: string){
        const webSite = await WebSite.findOne({uuid});
        if(webSite){
            return webSite
        }else {
            throw new Error("Une erreur est survenue.")
        }
    }*/
}

export default DatabaseMongoose;
