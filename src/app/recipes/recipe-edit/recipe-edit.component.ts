import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { Ingredient } from 'src/app/shared/ingredient.model';
import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';

@Component
({
    selector: 'app-recipe-edit',
    templateUrl: './recipe-edit.component.html',
    styleUrls: ['./recipe-edit.component.scss']
})
export class RecipeEditComponent implements OnInit, OnDestroy
{
    private subscription = new Subscription();
    public id: number;
    public editMode: boolean;
    public recipeForm: FormGroup;

    constructor(private route: ActivatedRoute,
                private recipeService: RecipeService) {

    }

    ngOnInit(): void
    {
        this.subscription.add(this.route.params.subscribe((params: Params) =>
        {
            this.id = +params['id'];
            this.editMode = params['id'] != null;
            this.initForm();
        }));

        if (this.editMode) this.loadRecipe();
    }

    ngOnDestroy(): void
    {
        this.subscription.unsubscribe();
    }

    public loadIngredients() {
        return (<FormArray>this.recipeForm.get('ingredients')).controls;
    }

    private loadRecipe(): void
    {
        console.log('Loading Recipe: ', this.id);
    }

    public onSubmit(): void
    {
        const newRecipe = new Recipe(
            this.recipeForm.value['name'],  
            this.recipeForm.value['description'],
            this.recipeForm.value['imagePath'],
            this.recipeForm.value['ingredients']
        );

        if (this.editMode)
        {
            this.recipeService.updateRecipe(this.id, newRecipe);
        }
        else
        {
            this.recipeService.addRecipe(newRecipe);
        }
    }

    public onAddIngredient()
    {
        (<FormArray>this.recipeForm.get('ingredients')).push(new FormGroup(
        {
            'name': new FormControl(null, Validators.required),
            'amount': new FormControl(null, [Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)])
        }))
    }

    private initForm(): void
    {
        let recipeName = '';
        let recipeImagePath = '';
        let recipeDescription = '';
        let recipeIngredients = new FormArray([]);

        if (this.editMode)
        {
            const recipe = this.recipeService.getRecipe(this.id);
            recipeName = recipe.name;
            recipeImagePath = recipe.imagePath;
            recipeDescription = recipe.description;

            if (recipe['ingredients'])
            {
                recipe.ingredients.forEach((ingredient: Ingredient) =>
                {
                    recipeIngredients.push(
                        new FormGroup(
                        {
                            'name': new FormControl(ingredient.name, Validators.required),
                            'amount': new FormControl(ingredient.amount, [Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)])
                        })
                    );
                });
            }
        }

        this.recipeForm = new FormGroup(
        {
            'name': new FormControl(recipeName, Validators.required),
            'imagePath': new FormControl(recipeImagePath, Validators.required),
            'description': new FormControl(recipeDescription, Validators.required),
            'ingredients': recipeIngredients
        });
    }
}