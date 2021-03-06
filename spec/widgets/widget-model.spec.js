var specHelper = require('../spec-helper');
var WidgetModel = require('../../src/widgets/widget-model');

describe('widgets/widget-model', function () {
  describe('when autostyle options is enabled', function () {
    beforeEach(function () {
      var vis = specHelper.createDefaultVis();
      // Use a category dataview as example
      var dataviewModel = vis.dataviews.createCategoryModel(vis.map.layers.first(), {
        column: 'col'
      });
      dataviewModel.remove = spyOn(dataviewModel, 'remove');

      this.model = new WidgetModel(null, {
        dataviewModel: dataviewModel
      }, {autoStyleEnabled: true});
    });

    describe('.update', function () {
      beforeEach(function () {
        this.widgetChangeSpy = jasmine.createSpy('widgetModel change');
        this.model.on('change', this.widgetChangeSpy);
      });

      describe('when given empty object', function () {
        beforeEach(function () {
          this.result = this.model.update();
          this.result = this.model.update({}) || this.result;
        });

        it('should return false since did not change anything', function () {
          expect(this.result).toBe(false);
        });

        it('should not change anything', function () {
          expect(this.widgetChangeSpy).not.toHaveBeenCalled();
          expect(this.model.dataviewModel.changedAttributes()).toBe(false);
        });
      });

      describe('when there are some attrsNames but no dataview attrs names defined', function () {
        beforeEach(function () {
          this.model.set({
            attrsNames: ['title']
          }, { silent: true });
          this.result = this.model.update({
            title: 'new title',
            column: 'col',
            aggregation: 'count',
            invalid: 'attr, should not be set'
          });
        });

        it('should return true since attrs were changed', function () {
          expect(this.result).toBe(true);
        });

        it('should update widget', function () {
          expect(this.widgetChangeSpy).toHaveBeenCalled();
        });

        it('should have changed the valid attrs and leave the rest', function () {
          expect(this.model.hasChanged('title')).toBe(true);
        });

        it('should not change existing attrs', function () {
          expect(this.model.hasChanged('collapsed')).toBe(false);
        });

        it('should not set any invalid attrs', function () {
          expect(this.model.get('invalid')).toBeUndefined();
        });

        it('should not update dataviewModel', function () {
          expect(this.model.dataviewModel.changedAttributes()).toBe(false);
        });
      });

      describe('when there are both widget and dataview attrs names defined', function () {
        beforeEach(function () {
          this.model.set({
            attrsNames: ['title']
          }, { silent: true });
          this.result = this.model.update({
            title: 'new title',
            column: 'other',
            aggregation: 'sum',
            foo: 'attr, should not be set'
          });
        });

        it('should return true since attrs were changed', function () {
          expect(this.result).toBe(true);
        });

        it('should update the widget', function () {
          expect(this.model.changedAttributes()).toEqual({
            title: 'new title'
          });
        });

        it('should update the dataview model attrs', function () {
          expect(this.model.dataviewModel.changedAttributes()).toEqual({
            column: 'other',
            aggregation: 'sum'
          });
        });
      });
    });

    describe('.remove', function () {
      beforeEach(function () {
        this.removeSpy = jasmine.createSpy('remove');
        spyOn(this.model, 'stopListening');
        this.model.on('destroy', this.removeSpy);
        this.model.remove();
      });

      it('should remove the model', function () {
        expect(this.removeSpy).toHaveBeenCalledWith(this.model);
      });

      it('should remove dataviewModel', function () {
        expect(this.model.dataviewModel.remove).toHaveBeenCalled();
      });

      it('should call stop listening to events', function () {
        expect(this.model.stopListening).toHaveBeenCalled();
      });
    });

    describe('getState', function () {
      it('should only return states different from default', function () {
        this.model.setState({
          collapsed: true
        });
        expect(this.model.getState()).toEqual({collapsed: true});
      });
    });

    describe('isAutoStyleEnabled', function () {
      beforeEach(function () {
        this.model.set('type', 'category');
      });

      it('should return true without style options', function () {
        expect(this.model.isAutoStyleEnabled()).toBe(true);
      });

      it('should return true with empty object style options', function () {
        this.model.set('style', {});
        expect(this.model.isAutoStyleEnabled()).toBe(true);
      });

      it('should return true with style options', function () {
        var style = {
          auto_style: {
            allowed: true
          }
        };
        this.model.set('style', style);
        expect(this.model.isAutoStyleEnabled()).toBe(true);
      });

      it('should return false with style options', function () {
        var style = {
          auto_style: {
            allowed: false
          }
        };
        this.model.set('style', style);
        expect(this.model.isAutoStyleEnabled()).toBe(false);
      });
    });
  });

  describe('when autostyle option is disabled', function () {
    beforeEach(function () {
      var vis = specHelper.createDefaultVis();
      // Use a category dataview as example
      this.dataviewModel = vis.dataviews.createCategoryModel(vis.map.layers.first(), {
        column: 'col'
      });
      this.dataviewModel.remove = spyOn(this.dataviewModel, 'remove');
    });

    describe('isAutoStyleEnabled', function () {
      it('should be false if without autostyle option', function () {
        var model = new WidgetModel(null, {
          dataviewModel: this.dataviewModel
        });

        model.set('type', 'category');

        expect(model.isAutoStyleEnabled()).toBe(false);
      });

      it('should be false if passed autostyle option as false', function () {
        var model = new WidgetModel(null, {
          dataviewModel: this.dataviewModel
        }, {autoStyleEnabled: false});

        model.set('type', 'category');

        expect(model.isAutoStyleEnabled()).toBe(false);
      });

      it('should be true if passed autostyle option as true', function () {
        var model = new WidgetModel(null, {
          dataviewModel: this.dataviewModel
        }, {autoStyleEnabled: true});

        model.set('type', 'category');

        expect(model.isAutoStyleEnabled()).toBe(true);
      });
    });
  });
});
